/* eslint-disable max-len */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { shell } from 'electron';
import './load.css';

function Load(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="main-loading">
      <svg
        className="logo-transparent"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1080 1080"
        width="1080"
        height="1080">
        <path
          id="Shape 11"
          className="logo"
          d="M540 551C484.15 551 439 505.85 439 450C439 394.15 484.15 349 540 349C595.85 349 641 394.15 641 450C641 505.85 595.85 551 540 551Z"
        />
        <path
          id="Shape 32"
          className="logo"
          d="M367 636C367 636 372.5 613.95 393 593C413.5 572.05 419.5 569.95 432 563C444.5 556.05 473 555 473 555C473 555 482.35 568.56 509 573C533 577 552 578 571 572C594.22 564.67 603 555 603 555C603 555 620.51 553.25 644 565C660 573 659 572.55 679 589.55C693.43 601.82 708 625.45 708 630C708 634.55 665 701 604 722C547.77 741.36 513.5 737.95 457 720C400.5 702.05 368 637 367 636Z"
        />
        <path
          id="Shape 35"
          className="logo"
          d="M149 208C149 208 290 18 561 32C563.23 32.12 306 474 306 474M632.41 40.15C632.41 40.15 867.49 66.94 991.19 308.47C992.21 310.46 480.91 309.32 480.91 309.32M1018.21 379.78C1018.21 379.78 1110.89 597.47 961.84 824.23C960.61 826.1 709.34 380.8 709.34 380.8M918.73 877.26C918.73 877.26 776.75 1066.52 505.82 1051.11C503.59 1050.98 763.12 610.45 763.12 610.45M437.33 1044.03C437.33 1044.03 202.46 1015.41 80.65 772.92C79.65 770.92 590.92 776.05 590.92 776.05M51.98 707.19C51.98 707.19 -40.89 489.57 107.96 262.68C109.19 260.81 360.85 705.89 360.85 705.89"
        />
      </svg>
      <h1 className="main-loading-message">
        <div className="app-name">
          <strong>Face</strong>Track
        </div>
        <br />
        {t('load.message')}
      </h1>
      <button
        className="github-user"
        type="button"
        onClick={() => {
          void shell.openExternal('https://github.com/mdjfs');
        }}>
        @mdjfs
      </button>
    </div>
  );
}

export default Load;
