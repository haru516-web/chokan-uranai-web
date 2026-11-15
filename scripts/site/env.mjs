// 公開URLと「検索に出すか」を、環境から決める。どこに置いても（Vercel・別のアカウント・手元）、コードを書き換えずに動くようにする。
//   Vercel のとき … 本番（VERCEL_ENV=production）だけ検索に出す。URLは、Vercelが渡す本番のドメインを使う（独自ドメインを足すと、そちらに変わる）。
//                   プレビュー（ブランチ・プルリクエスト）は、必ず noindex。
//   それ以外       … SITE_URL と SITE_INDEX=1 の両方があるときだけ、検索に出す。
// SITE_URL を自分で指定すれば、どちらの場合も、それが優先される。
export function resolveSite(env = process.env) {
  const onVercel = env.VERCEL === '1';
  const production = onVercel ? env.VERCEL_ENV === 'production' : env.SITE_INDEX === '1';
  let url = env.SITE_URL || '';
  if (!url && onVercel) {
    const host = production ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL;
    if (host) url = `https://${host}/`;
  }
  return { siteUrl: url, index: production && Boolean(url) };
}
