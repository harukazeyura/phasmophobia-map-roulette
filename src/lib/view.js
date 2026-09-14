// URL パラメータ。?view=overlay のときは OBS 用オーバーレイとして表示する
export const params = new URLSearchParams(location.search);
export const isOverlay = params.get('view') === 'overlay';
