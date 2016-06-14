### v3.0.0

* Switch to `gauge@2.0.0`, for better performance, better look.
* Set stderr/stdout blocking if they're tty's, so that we can hide a
  progress bar going to stderr and then safely print to stdout.  Without
  this the two can end up overlapping producing confusing and sometimes
  corrupted output.

### v2.0.0

* Make the `error` event non-fatal so that folks can use it as a prefix.

### v1.0.0

* Add progress bar with `gauge@1.1.0`
