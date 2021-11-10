import * as React from "react";
import * as ReactQuery from "react-query";

export function Likes(props) {
  if (!import.meta.env.SNOWPACK_PUBLIC_API_LIKES_URL) {
    return null;
  }

  return (
    <React.Suspense
      fallback={
        <section className="cardmessage">
          <h2>Loading Likes...</h2>
        </section>
      }
    >
      <LikesResource imageKeyS3={props.imageKeyS3} />
    </React.Suspense>
  );
}

function LikesResource(props) {
  let queryClient = ReactQuery.useQueryClient();
  let likes = ReactQuery.useQuery(["getLikesForImageKeyS3", props.imageKeyS3], () =>
    getLikesForImageKeyS3(props.imageKeyS3)
  );
  let mutationVote = ReactQuery.useMutation(onClickVote, {
    onSuccess: () => {
      queryClient.invalidateQueries(["getLikesForImageKeyS3", props.imageKeyS3]);
    },
  });

  return (
    <ul className="likeslist">
      <li className="totalvoteitem">
        <strong>Total Likes:</strong>
        <span>{likes.data.likes}</span>
        {mutationVote.isLoading && <span className="bulletlabel">Updating...</span>}
      </li>
      <li className="upvoteitem">
        <strong>Upvote:</strong>
        <button
          type="button"
          disabled={mutationVote.isLoading}
          onClick={(event) => {
            event.preventDefault();
            mutationVote.mutate({ likes: +1, imageKeyS3: props.imageKeyS3 });
          }}
        >
          👍
        </button>
      </li>
      <li className="downvoteitem">
        <strong>Downvote:</strong>
        <button
          type="button"
          disabled={mutationVote.isLoading}
          onClick={(event) => {
            event.preventDefault();
            mutationVote.mutate({ likes: -1, imageKeyS3: props.imageKeyS3 });
          }}
        >
          👎
        </button>
      </li>
    </ul>
  );
}

async function onClickVote(payload) {
  let url = import.meta.env.SNOWPACK_PUBLIC_API_LIKES_URL;
  let res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  let json = await res.json();
  json = json.Attributes;
  return json;
}

async function getLikesForImageKeyS3(imageKeyS3) {
  let url = import.meta.env.SNOWPACK_PUBLIC_API_LIKES_URL + "/" + imageKeyS3;
  let res = await fetch(url);
  let json = await res.json();
  let record = (json.Items[0] ??= { likes: 0 });
  return record;
}
