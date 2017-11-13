export default httpClient => (options, cancelled$) => {
  if (!cancelled$) {
    // eslint-disable-next-line no-console
    console.error('Missing cancelled$ argument');
  }
  const source = httpClient.CancelToken.source(); // axios.CancelToken
  cancelled$.subscribe(() => {
    source.cancel();
  });
  return httpClient({
    cancelToken: source.token,
    ...options,
  });
}