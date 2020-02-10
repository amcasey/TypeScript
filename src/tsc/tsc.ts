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

// TODO (acasey): fork in a sensible place
if (ts.sys.isWorker || !ts.sys.fork) {
    ts.executeCommandLine(ts.sys, ts.noop, ts.sys.args); // TODO (acasey): I don't see how we can honor callbacks in parallel mode - I don't believe they can cross thread boundaries
}
else {
    // TODO (acasey): does this process survive?
    ts.sys.fork(ts.sys.args).catch(err => { ts.sys.write(err + ts.sys.newLine); });
}


// TODO (acasey): need a way to detect we're a helper thread/process
//  Build only one project
//  Don't do up-to-date checks
//  Don't watch files/dirs
// Trivial for threads - several imports indicate whether this is the main thread or a child
// Processes can tell whether they have an IPC channel to a parent process, but there are probably already callers forking us from node processes

// TODO (acasey): What's the entrypoint for the web-hosted version of the compiler?
