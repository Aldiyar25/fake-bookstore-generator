import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "../App.css";

const Controls = ({
  lang,
  onLangChange,
  seed,
  onSeedChange,
  avgLikes,
  onAvgLikesChange,
  avgReviews,
  onAvgReviewsChange,
}) => {
  return (
    <div className="controls-container">
      <div className="controls-left">
        <label>
          Language:
          <select
            value={lang}
            onChange={(e) => onLangChange(e.target.value)}
            style={{ marginTop: "4px" }}
          >
            <option value="en">English</option>
            <option value="ru">Russian</option>
            <option value="fr">French</option>
          </select>
        </label>
        <label>
          Seed:
          <input
            type="text"
            value={seed}
            onChange={(e) => onSeedChange(e.target.value)}
            style={{ marginTop: "4px" }}
          />
        </label>
      </div>

      <div className="controls-right">
        <label>
          Avg Likes: {avgLikes}
          <Slider
            min={0}
            max={10}
            step={0.5}
            value={avgLikes}
            onChange={onAvgLikesChange}
            style={{ marginTop: "8px", width: "150px" }}
          />
        </label>

        <label>
          Avg Reviews: {avgReviews}
          <Slider
            min={0}
            max={10}
            step={0.5}
            value={avgReviews}
            onChange={onAvgReviewsChange}
            style={{ marginTop: "8px", width: "150px" }}
          />
        </label>
      </div>
    </div>
  );
};

export default Controls;
