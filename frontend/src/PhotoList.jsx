import * as React from "react";
import * as ReactQuery from "react-query";

import { Likes } from "./Likes";

export function PhotoList() {
  if (!import.meta.env.SNOWPACK_PUBLIC_API_IMAGES_URL) {
    return null;
  }

  return (
    <React.Suspense
      fallback={
        <section className="cardmessage loading">
          <h2>Fetching your photos...</h2>
        </section>
      }
    >
      <PhotoListResource />
    </React.Suspense>
  );
}

function PhotoListResource() {
  let photos = ReactQuery.useQuery("getPhotos", getPhotos);

  if (photos.data.length === 0) {
    return (
      <header className="cardmessage">
        <h2>You have no photos to display :(</h2>
        <p>Upload a new photo now!</p>
      </header>
    );
  }

  if (!import.meta.env.SNOWPACK_PUBLIC_CLOUDFRONT_URL) {
    return null;
  }

  return (
    <ul className="photolist">
      {photos.data.map((photo, index) => {
        let imageKeyS3 = photo.url.split("/")[1];
        return (
          <li key={photo.id}>
            <h3>Photo #{++index}</h3>
            <div>
              <img src={import.meta.env.SNOWPACK_PUBLIC_CLOUDFRONT_URL + "/" + photo.url} alt="" />
              <Likes imageKeyS3={imageKeyS3} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

async function getPhotos() {
  let url = import.meta.env.SNOWPACK_PUBLIC_API_IMAGES_URL;
  let res = await fetch(url);
  let json = await res.json();
  json = json.map((item) => {
    return {
      id: item.id,
      url: item.url,
    };
  });
  return json;
}
