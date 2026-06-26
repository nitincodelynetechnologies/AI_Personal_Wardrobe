export function FaceRegisterSkeleton() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-violet/30 bg-violet/5">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet border-t-transparent" />
        </div>
        <div className="space-y-2">
          <h2 className="font-playfair text-xl font-semibold">Preparing Camera</h2>
          <p className="text-sm text-muted-foreground">
            Setting up your secure face registration experience…
          </p>
        </div>
        <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-violet to-transparent bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
}
