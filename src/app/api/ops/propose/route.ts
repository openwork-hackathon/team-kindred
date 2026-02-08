import { handleCreateProposal } from '@/lib/proposal-service';

export async function POST(req: Request) {
  const request = {
    body: await req.json(),
  };

  const response = { status: 200, json: (data: any) => data };

  const mockRes = {
    status: (code: number) => ({
      json: (data: any) => {
        response.status = code;
        response.json = data;
        return data;
      },
    }),
  };

  await handleCreateProposal(request, mockRes);

  return new Response(JSON.stringify(response.json), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
