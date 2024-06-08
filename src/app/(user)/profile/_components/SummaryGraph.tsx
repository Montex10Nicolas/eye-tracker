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
        label: "Planning",
        data: [moviePlanned, tvSeriePlanned, tvSeasonPlanned],
        backgroundColor: "rgba(255, 125, 255, 0.2)",
      },
      {
        label: "Watched/Completed",
        data: [movieWatched, tvSerieCompleted, tvSeasonCompleted],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Watching",
        data: [0, tvSerieWatching, tvSeasonWatching],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Dropped",
        data: [0, tvSerieDropped, tvSeasonDropped],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Paused",
        data: [0, tvSeriePaused, tvSeasonPaused],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };

  return (
    <div className="grid grid-rows-2 items-center justify-center md:grid-cols-2 md:grid-rows-1">
      <Bar
        className="max-h-[300px] max-w-[400px]"
        options={{
          scales: {
            y: {
              ticks: {
                precision: 1,
              },
            },
          },
        }}
        data={data}
      />
      <Radar
        className="max-h-[300px] max-w-[400px]"
        options={{
          scales: {
            y: {
              ticks: {
                precision: 1,
              },
            },
          },
        }}
        data={data}
      />
    </div>
  );
}

export function RadarGraph(props: { info: DBUserInfoType }) {
  const { info } = props;
  const {
    tvSerieCompleted,
    tvSerieWatching,
    tvSeasonCompleted,
    tvSeasonDropped,
    tvSeasonPaused,
    tvSeasonPlanned,
    tvSeasonWatching,
    tvSerieDropped,
    tvSeriePaused,
    tvSeriePlanned,
  } = info;

  const serieTotal =
    tvSerieDropped +
    tvSeriePaused +
    tvSeriePlanned +
    tvSerieCompleted +
    tvSerieWatching;
  const seasonTotal =
    tvSeasonDropped +
    tvSeasonPaused +
    tvSeasonPlanned +
    tvSeasonCompleted +
    tvSeasonWatching;

  function percentual(n: number, total: number) {
    // total:100=n:x
    return Math.ceil((n * 100) / total);
  }
  const seriePlanned = percentual(tvSeriePlanned, serieTotal);
  const serieWatching = percentual(tvSerieWatching, serieTotal);
  const serieCompleted = percentual(tvSerieCompleted, serieTotal);
  const serieDropped = percentual(tvSerieDropped, serieTotal);
  const seriePaused = percentual(tvSeriePaused, serieTotal);
  const seasonPlanned = percentual(tvSeasonPlanned, seasonTotal);
  const seasonWatching = percentual(tvSeasonWatching, seasonTotal);
  const seasonCompleted = percentual(tvSeasonCompleted, seasonTotal);
  const seasonDropped = percentual(tvSeasonDropped, seasonTotal);
  const seasonPaused = percentual(tvSeasonPaused, seasonTotal);

  const data = {
    labels: ["Planning", "Watching", "Completed", "Paused", "Dropped"],
    datasets: [
      {
        label: "Serie(%)",
        data: [
          seriePlanned,
          serieWatching,
          serieCompleted,
          seriePaused,
          serieDropped,
        ],
        fill: true,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgb(255, 99, 132)",
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
      {
        label: "Season(%)",
        data: [
          seasonPlanned,
          seasonWatching,
          seasonCompleted,
          seasonPaused,
          seasonDropped,
        ],
        fill: true,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgb(255, 99, 132)",
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
    ],
  };
  return <Bar className="max-h-[300px] max-w-[400px]" data={data} />;
}
