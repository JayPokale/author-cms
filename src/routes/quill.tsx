import { unstable_clientOnly } from "solid-start";

const QuillEditor = unstable_clientOnly(() => import("~/components/Quill"));

const quill = () => {
  return <div>{typeof window !== "undefined" && <QuillEditor />}</div>;
};

export default quill;
