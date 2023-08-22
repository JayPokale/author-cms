const Input = (props: any) => {
  const attrs = {
    id: props.id,
    name: props.id,
    class:
      "bg-gray-100 appearance-none border-2 border-gray-100 rounded w-full pt-2 pb-3 px-4 text-gray-700 leading-tight outline-none focus:bg-white duration-200",
    type: props.type,
    placeholder: props.placeholder,
  };
  return props.required ? <input {...attrs} required /> : <input {...attrs} />;
};

export default Input;
