import { Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';

const getArgsLog = (args: any[] = []) =>
  args
    ?.filter(arg => arg)
    .map(arg => (typeof arg !== 'object' ? arg : JSON.stringify(arg)))
    .join(' ');

// eslint-disable-next-line @typescript-eslint/ban-types
const timeExecution = <TFunction extends Function>(
  target: TFunction,
  methodName: string,
  flag: string
) => {
  const originalMethod = target.prototype[methodName];

  target.prototype[methodName] = async function (...args: any[]) {
    const start = Date.now();
    const id = nanoid();
    const logger = new Logger(flag);
    logger.log(`--> [${id}] [${methodName}] ${getArgsLog(args)}`);
    try {
      const result = await originalMethod.apply(this, args);
      const end = Date.now();
      logger.log(`<-- [${id}] [${methodName}] took ${end - start}ms to execute.`);
      return result;
    } catch (error) {
      const end = Date.now();

      logger.error(
        `<-- [${id}] [${methodName}] took ${end - start}ms to execute, [${error.statusCode}] ${
          error.name
        }: ${JSON.stringify(error.body)}`
      );
      throw error;
    }
  };
};

export interface TimeExecOptions {
  /** 不包含的方法 */
  exludes?: string[];
}

export function TimeExec(options: TimeExecOptions = {}): ClassDecorator {
  const { exludes = [] } = options;
  return target => {
    for (const methodName of Object.getOwnPropertyNames(target.prototype)) {
      if (
        methodName !== 'constructor' &&
        typeof target.prototype[methodName] === 'function' &&
        !exludes.includes(methodName)
      ) {
        timeExecution(target, methodName, target.name);
      }
    }
  };
}
