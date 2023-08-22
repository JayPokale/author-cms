const uploadImage = async (image: File) => {
  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);
  formData.append("cloud_name", import.meta.env.VITE_CLOUDNAME);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDNAME
      }/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();
    return data.secure_url;
  } catch {
    return "";
  }
};

export default uploadImage;
