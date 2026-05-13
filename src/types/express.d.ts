declare namespace Express {
  interface Request {
    auth?: {
      userId: string;
      jwtId: string;
      tokenVersion: number;
    };
  }
}
