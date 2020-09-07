import { Expect, Test, TestFixture } from "alsatian";
import * as p from "./pipe";

interface TestContext {
    isTestContext: true;
    count: number;
}

interface TestTarget {
    isTestObject: true;
}

interface ChainedTarget extends TestTarget {
    isChainedTarget: true;
    previous: TestTarget;
}

class TestPipeStart implements p.PipeUnion<TestContext, TestTarget> {
    async flow(ctx: TestContext): Promise<TestTarget> {
        ctx.count++;
        return {
            isTestObject: true
        }
    }
}

class TestPipeUnion implements p.PipeUnion<TestContext, TestTarget> {
    async flow(ctx: TestContext, content: TestTarget): Promise<ChainedTarget> {
        ctx.count++;
        return {
            isTestObject: true,
            isChainedTarget: true,
            previous: content
        }
    }
}

class TestPipeStartSync implements p.PipeUnionSync<TestContext, TestTarget> {
    flow(ctx: TestContext): TestTarget {
        ctx.count++;
        return {
            isTestObject: true
        }
    }
}

class TestPipeUnionSync implements p.PipeUnionSync<TestContext, TestTarget> {
    flow(ctx: TestContext, content: TestTarget): ChainedTarget {
        ctx.count++;
        return {
            isTestObject: true,
            isChainedTarget: true,
            previous: content
        }
    }
}

@TestFixture("Pipe Test Suite")
export class TestSuite {
    constructor() {
    }

    @Test("Test async pipe")
    async testAsyncPipe(): Promise<void> {
        const pipe = p.pipe<TestContext, TestTarget>(new TestPipeStart(), new TestPipeUnion());
        const ctx: TestContext = { isTestContext: true, count: 0 };
        const result = (await pipe.flow(ctx)) as ChainedTarget;
        Expect(ctx.count).toBe(2);
        Expect(result.isChainedTarget).toBe(true);
    }

    @Test("Test sync pipe")
    testSyncPipe(): void {
        const pipe = p.pipeSync<TestContext, TestTarget>(new TestPipeStartSync(), new TestPipeUnionSync());
        const ctx: TestContext = { isTestContext: true, count: 0 };
        const result = pipe.flow(ctx) as ChainedTarget;
        Expect(ctx.count).toBe(2);
        Expect(result.isChainedTarget).toBe(true);
    }
}
