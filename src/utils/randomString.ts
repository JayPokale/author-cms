const randomString = (n: number) => {
  const items =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let str = "";
  for (let i = 0; i < n; ++i) str += items[~~(Math.random() * 62)];
  return str;
};

export default randomString;
