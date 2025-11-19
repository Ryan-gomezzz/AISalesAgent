import http from 'http';
import { WebSocketServer } from 'ws';
import { env } from './config';
import { logger } from './logger';
import { Session } from './session';

const activeSessions = new Map<string, Session>();

const server = http.createServer((req, res) => {
  if (req.url?.startsWith('/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', activeSessions: activeSessions.size }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server, path: '/twilio' });

wss.on('connection', (socket, request) => {
  const url = new URL(request.url ?? '', `http://${request.headers.host}`);
  const leadId = url.searchParams.get('leadId');
  const inquiryType = url.searchParams.get('inquiryType') ?? undefined;

  if (!leadId) {
    socket.close(1011, 'leadId required');
    return;
  }

  if (activeSessions.size >= env.maxParallelSessions) {
    socket.close(1013, 'Server busy');
    return;
  }

  const session = new Session(socket, leadId, inquiryType ?? undefined);
  activeSessions.set(leadId, session);
  logger.info({ leadId }, 'Session started');

  socket.on('message', (message) => {
    session.handleRawMessage(message.toString());
  });

  socket.on('close', () => {
    logger.info({ leadId }, 'Session closed');
    activeSessions.delete(leadId);
    void session.terminate();
  });

  socket.on('error', (err) => {
    logger.error({ err, leadId }, 'WebSocket error');
  });
});

server.listen(env.port, () => {
  logger.info({ port: env.port }, 'Session manager listening');
});
