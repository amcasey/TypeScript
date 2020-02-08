namespace ts {} // empty ts module so the module migration script knows this file depends on the `ts` project namespace
// This file actually uses arguments passed on commandline and executes it
if (ts.Debug.isDebugging) {
    ts.Debug.enableDebugInfo();
}

if (ts.sys.tryEnableSourceMapsForHost && /^development$/i.test(ts.sys.getEnvironmentVariable("NODE_ENV"))) {
    ts.sys.tryEnableSourceMapsForHost();
}

if (ts.sys.setBlocking) {
    ts.sys.setBlocking();
}

ts.executeCommandLine(ts.sys, ts.noop, ts.sys.args); // TODO (acasey): I don't see how we can honor callbacks in parallel mode - I don't believe they can cross thread boundaries

// TODO (acasey): assuming this is the entry point of the helper threads, there needs to be a way to build a single project
// Manipulating args is probably sufficient, but it will likely require a bunch of redundant up-to-date checks
