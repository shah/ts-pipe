export interface Pipe<C, T> {
    execute(ctx: C, content?: T): Promise<T>;
}

export function pipe<C, T>(...elements: Pipe<C, T>[]): Pipe<C, T> {
    if (elements.length == 0) {
        return new class implements Pipe<C, T> {
            async execute(ctx: C, content: T): Promise<T> {
                return content;
            }
        }()
    }
    if (elements.length == 1) {
        return new class implements Pipe<C, T> {
            async execute(ctx: C, content: T): Promise<T> {
                return await elements[0].execute(ctx, content);
            }
        }()
    }
    return new class implements Pipe<C, T> {
        async execute(ctx: C, content: T): Promise<T> {
            let result = await elements[0].execute(ctx, content);
            for (let i = 1; i < elements.length; i++) {
                result = await elements[i].execute(ctx, result);
            }
            return result;
        }
    }()
}