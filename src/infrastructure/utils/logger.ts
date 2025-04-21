import pino from "pino";
import "pino-pretty";

export function createPinoLogger(service: string) {
  const logger = pino({
    level: process.env["LOG_LEVEL"] || "info",
    base: { service },
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
  
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        timeZone: "Asia/Bangkok", 
        ignore: "pid,hostname",
      },
    },
  });
  return logger;
}
