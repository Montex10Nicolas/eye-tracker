"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Radar } from "react-chartjs-2";
import { type DBUserInfoType } from "~/server/db/types";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

export function SummaryGraph(props: { info: DBUserInfoType }) {
  const { info } = props;
  const {
    movieWatched,
    movieDurationTotal,
    tvDurationTotal,
    tvEpisodeCount,
    tvSerieCompleted,
    tvSerieWatching,
    tvSeasonCompleted,
    moviePlanned,
    tvSeasonDropped,
    tvSeasonPaused,
    tvSeasonPlanned,
    tvSeasonWatching,
    tvSerieDropped,
    tvSeriePaused,
    tvSeriePlanned,
  } = info;

  const data = {
    labels: ["movie", "serie", "season"],
    datasets: [
      {
        label: "Watched/Completed",
        data: [movieWatched, tvSerieCompleted, tvSeasonCompleted],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };

  return <Bar data={data} />;
}
