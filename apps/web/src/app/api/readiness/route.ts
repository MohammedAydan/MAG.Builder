import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { getRuntimeEnv } from "@/lib/env";
import { safeClientError, logger } from "@nexpress/observability";

export async function GET() {
  try {
    const env = getRuntimeEnv();
    
    // Check basic config
    const hasDatabase = !!env.DATABASE_URL;
    const hasSecret = !!env.PAYLOAD_SECRET;
    
    let payloadReady = false;
    if (hasDatabase && hasSecret) {
      try {
        const payload = await getPayloadClient();
        // A simple query to verify DB connection
        await payload.find({ collection: "users", limit: 1 });
        payloadReady = true;
      } catch (err) {
        logger.error("Readiness check failed during Payload init", { error: err });
        payloadReady = false;
      }
    }

    const isReady = hasDatabase && hasSecret && payloadReady;
    const status = isReady ? 200 : 503;

    return NextResponse.json({
      status: isReady ? "ready" : "unavailable",
      checks: {
        databaseConfigured: hasDatabase,
        secretConfigured: hasSecret,
        payloadInitialized: payloadReady
      },
      timestamp: new Date().toISOString()
    }, {
      status,
      headers: {
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    logger.error("Readiness check crashed", { error });
    return NextResponse.json(
      safeClientError(error, "Readiness check failed"),
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
