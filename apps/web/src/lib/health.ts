import { env } from "@/lib/env";

export type HealthPayload = {
  environment: string;
  service: "web";
  status: "ok";
  timestamp: string;
};

export function buildHealthPayload(): HealthPayload {
  return {
    status: "ok",
    service: "web",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
}
