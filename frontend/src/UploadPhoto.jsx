import * as React from "react";
import * as ReactQuery from "react-query";

export function UploadPhoto() {
  if (!import.meta.env.SNOWPACK_PUBLIC_API_IMAGES_URL) {
    return null;
  }

  let queryClient = ReactQuery.useQueryClient();
  let mutation = ReactQuery.useMutation(onChangeFileInput, {
    onSuccess: () => {
      queryClient.invalidateQueries("getPhotos");
    },
  });

  return (
    <aside>
      <label htmlFor="inputUploadPhoto" className={mutation.status}>
        {mutation.isLoading ? "Saving..." : "Upload Photo"}
        <input
          type="file"
          id="inputUploadPhoto"
          onChange={mutation.isLoading ? null : mutation.mutate}
          disabled={mutation.isLoading}
        />
      </label>
    </aside>
  );
}

async function onChangeFileInput(event) {
  event.preventDefault();
  let [firstFile] = event.target.files;
  let dataPresignedS3 = await getPresignedS3Url(firstFile);
  await uploadFileToS3(dataPresignedS3, firstFile);
}

async function getPresignedS3Url(file) {
  let resPresignedS3 = await fetch(import.meta.env.SNOWPACK_PUBLIC_API_IMAGES_URL, {
    method: "POST",
    body: JSON.stringify({ fileName: file.name }),
  });
  let dataPresignedS3 = await resPresignedS3.json();
  return dataPresignedS3;
}

async function uploadFileToS3(dataPresignedS3, file) {
  let reqUploadS3Payload = new FormData();
  Object.entries(dataPresignedS3.fields).forEach(([k, v]) => {
    reqUploadS3Payload.append(k, v);
  });
  reqUploadS3Payload.append("file", file);
  let resUploadS3 = await fetch(dataPresignedS3.url, {
    method: "POST",
    body: reqUploadS3Payload,
  });
  let dataUploadS3 = await resUploadS3.text();
  return dataUploadS3;
}
