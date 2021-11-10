import * as React from "react";

import "./App.css";

import AppLogo from "./images/app-logo.png";

import { UploadPhoto } from "./UploadPhoto";
import { PhotoList } from "./PhotoList";

export function App() {
  let cloudfrontUrl = !import.meta.env.SNOWPACK_PUBLIC_CLOUDFRONT_URL;
  let apiImagesUrl = !import.meta.env.SNOWPACK_PUBLIC_API_IMAGES_URL;
  let apiLikesUrl = !import.meta.env.SNOWPACK_PUBLIC_API_LIKES_URL;
  if (cloudfrontUrl) {
    console.warn("[REQUIRED] Missing environment variable: SNOWPACK_PUBLIC_CLOUDFRONT_URL");
  }
  if (apiImagesUrl) {
    console.warn("[REQUIRED] Missing environment variable: SNOWPACK_PUBLIC_API_IMAGES_URL");
  }
  if (apiLikesUrl) {
    console.warn("[REQUIRED] Missing environment variable: SNOWPACK_PUBLIC_API_LIKES_URL");
  }
  return (
    <React.Fragment>
      <header id="topbar">
        <div>
          <img src={AppLogo} alt="Coffee Listing App Logo" width={56} height={56} />
          <h1>Coffee Listing App</h1>
        </div>
      </header>
      <main>
        <UploadPhoto />
        <PhotoList />
      </main>
    </React.Fragment>
  );
}
