import { Link } from "@remix-run/react";

export default function ReviewIndexPage() {
  return (
    <p>
      No review selected. Select a review on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new review.
      </Link>
    </p>
  );
}
