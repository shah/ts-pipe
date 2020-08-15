export interface PipeContext {
}

export interface PipeUnion<C, T> {
    flow(ctx: C, content?: T): Promise<T>;
}

export function pipe<C, T>(...elements: PipeUnion<C, T>[]): PipeUnion<C, T> {
    if (elements.length == 0) {
        return new class implements PipeUnion<C, T> {
            async flow(ctx: C, content: T): Promise<T> {
                return content;
            }
        }()
    }
    if (elements.length == 1) {
        return new class implements PipeUnion<C, T> {
            async flow(ctx: C, content: T): Promise<T> {
                return await elements[0].flow(ctx, content);
            }
        }()
    }
    return new class implements PipeUnion<C, T> {
        async flow(ctx: C, content: T): Promise<T> {
            let result = await elements[0].flow(ctx, content);
            for (let i = 1; i < elements.length; i++) {
                result = await elements[i].flow(ctx, result);
            }
            return result;
        }
    }()
}