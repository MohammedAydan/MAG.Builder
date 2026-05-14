import { NextResponse } from 'next/server';
import { parseBuilderSaveRequest, saveBuilderPageDraft } from '@/lib/builder/editor';
import { getDashboardUser } from '@/lib/dashboard/session';

type BuilderSaveRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: BuilderSaveRouteProps) {
  const user = await getDashboardUser();

  if (!user) {
    return NextResponse.json(
      {
        errors: ['Authentication is required to save builder drafts.'],
      },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const parsedBody = parseBuilderSaveRequest(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          errors: parsedBody.error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }

    const { id } = await params;
    const result = await saveBuilderPageDraft({
      data: parsedBody.data.data,
      id,
      user,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          errors: result.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      savedAt: result.savedAt,
    });
  } catch (error) {
    const status = error instanceof Error && error.message === 'Forbidden' ? 403 : 500;

    return NextResponse.json(
      {
        errors: [status === 403 ? 'You do not have permission to edit page builder drafts.' : 'Builder draft save failed.'],
      },
      { status },
    );
  }
}
