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

if (ts.sys.on) {
    ts.sys.on("parentRequest", args => {
        try {
            ts.executeCommandLine(ts.sys, ts.noop, args); // TODO (acasey): I don't see how we can honor callbacks in parallel mode - I don't believe they can cross thread boundaries
            return ts.ExitStatus.Success;
        }
        catch(e) {
            if (e instanceof ts.ExitException) {
                return e.exitCode ?? ts.ExitStatus.Success;
            }
            ts.sys.write(e); // TODO (acasey): error handling
            return -1; // TODO (acasey): enum value?
        }
    });
}
else if (ts.sys.fork) {
    // TODO (acasey): This should be in build mode and for specific projects
    ts.sys.fork(ts.sys.args).then(
        result => { ts.sys.write(result.stdout); ts.sys.exit(result.exitCode); },
        err => { ts.sys.write("Worker error: " + err + ts.sys.newLine); });
}
else {
    ts.executeCommandLine(ts.sys, ts.noop, ts.sys.args);
}


// TODO (acasey): If worker
//  Build only one project
//  Don't do up-to-date checks
//  Don't watch files/dirs

// TODO (acasey): What's the entrypoint for the web-hosted version of the compiler?
