// On soft navigations the script becomes type="text/plain" so it does not re-run.
export function SeedFromSearchParam({ param, targetId }: { param: string; targetId: string }) {
  const html = `(function(){
  var el = document.getElementById(${JSON.stringify(targetId)});
  if (!el) return;
  var v = new URLSearchParams(location.search).get(${JSON.stringify(param)});
  if (v) el.value = v;
})()`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
    />
  );
}
