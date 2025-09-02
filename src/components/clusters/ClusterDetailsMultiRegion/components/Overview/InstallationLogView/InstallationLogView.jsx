/* eslint-disable react/destructuring-assignment */
import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import screenfull from 'screenfull';

import { Button, ExpandableSection } from '@patternfly/react-core';
import { ExpandIcon } from '@patternfly/react-icons/dist/esm/icons/expand-icon';

import clusterStates from '../../../../common/clusterStates';
import { metricsStatusMessages } from '../../../../common/ResourceUsage/constants';

const AUTOSCROLL_THRESHOLD = 20;

// shouldComponentUpdate into React.memo
const areEqual = (prevProps, nextProps) =>
  prevProps.lines === nextProps.lines &&
  prevProps.cluster.state === nextProps.cluster.state &&
  prevProps.cluster.id === nextProps.cluster.id &&
  prevProps.errorCode === nextProps.errorCode &&
  prevProps.logType === nextProps.logType &&
  prevProps.isExpandable === nextProps.isExpandable;

const LogWindow = ({
  isExpandable,
  getLogs,
  cluster,
  lines,
  len,
  logType,
  pending,
  errorCode,
  clearLogs,
}) => {
  const logPaneRef = React.useRef(null);
  const cardRef = React.useRef(null);
  const updateTimer = React.useRef(null);

  const [userScrolled, setUserScrolled] = React.useState(false);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isPageVisible, setIsPageVisible] = React.useState(false);

  // Needed for componentDidUpdate
  const prevProps = React.useRef({ lines: null, errorCode: null, cluster: {} });
  const prevState = React.useRef({ isExpanded: false });

  /**
   * Is the view expanded (or non-expandable)?
   */
  const isShown = () => !isExpandable || isExpanded;

  const update = () => {
    if (!pending && errorCode !== 403) {
      const requestLogType = cluster.state !== clusterStates.uninstalling ? 'install' : 'uninstall';
      let offset = lines ? len : 0;
      if (logType !== requestLogType) {
        offset = 0;
      }

      getLogs(cluster.id, offset, requestLogType, cluster.subscription?.rh_region_id);
    }
  };

  const scrollToEnd = () => {
    if (lines) {
      const pane = logPaneRef.current;
      if (pane && pane.scrollTo) {
        pane.scrollTo({ top: pane.scrollHeight });
      }
    }
  };

  const onFullscreenChange = () => {
    setIsFullScreen(screenfull.isFullscreen);
    if (!userScrolled) {
      scrollToEnd();
    }
  };

  const onVisibilityChange = () => {
    if (updateTimer.current !== null) {
      window.clearInterval(updateTimer.current);
      updateTimer.current = null;
    }
    setIsPageVisible(document.visibilityState === 'visible');
    if (isShown()) {
      if (isPageVisible) {
        // update very 2s when page is visible
        updateTimer.current = window.setInterval(update, 2000);
        // issue another update call just to make sure we show fresh logs
        //  when the page becomes visible
        update();
      } else {
        // update every 15s if page is not visible, for better performance
        updateTimer.current = window.setInterval(update, 15000);
      }
    }
  };

  const onScroll = (event) => {
    const view = event.target;
    const currentScrollDiff = view.scrollHeight - view.clientHeight - view.scrollTop;
    if (!userScrolled && currentScrollDiff > AUTOSCROLL_THRESHOLD && isPageVisible && isShown()) {
      // user scrolled to anywhere which isn't the very bottom, stop auto-scrolling
      setUserScrolled(true);
    }
    if (userScrolled && currentScrollDiff <= AUTOSCROLL_THRESHOLD) {
      // user scrolled to the bottom (approximately), start auto-scrolling again
      setUserScrolled(false);
    }
  };

  const fullScreen = () => {
    if (!screenfull.isFullscreen) {
      const card = cardRef.current;
      screenfull.request(card).then(() => {
        if (!userScrolled) {
          // scroll to end if userScrolled was false *before* the fullscreen transition
          // with timeout to allow slower browsers to complete the fullscreen transition.
          setTimeout(() => {
            scrollToEnd();
          }, 100);
        }
        setIsFullScreen(true);
      });
    } else {
      screenfull.exit().then(() => {
        setIsFullScreen(false);
      });
    }
  };

  React.useEffect(() => {
    if (isShown()) {
      update();
      updateTimer.current = window.setInterval(update, 2000);
    }
    if (screenfull.isEnabled) {
      screenfull.on('change', onFullscreenChange);
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    setIsPageVisible(document.visibilityState === 'visible');

    return () => {
      if (updateTimer.current !== null) {
        clearInterval(updateTimer.current);
        updateTimer.current = null;
      }

      if (screenfull.isEnabled) {
        screenfull.off('change', onFullscreenChange);
      }

      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearLogs();

      if (screenfull.isFullscreen) {
        screenfull.exit();
      }
    };

    // componentDidMount and componentWillUnmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!prevProps.lines && lines) {
      // If this is the first time we're getting the log, it'll trigger a scroll event,
      // setting userScrolled since the view won't be scrolled all the way down.
      // So we need to account for that, and set it to false here.
      // eslint-disable-next-line react/no-did-update-set-state
      setUserScrolled(false);
    }

    if (
      updateTimer.current !== null &&
      ((prevProps.errorCode !== 403 && errorCode === 403) || cluster.state === clusterStates.error)
    ) {
      window.clearInterval(updateTimer.current);
      updateTimer.current = null;
    }
    if (isExpanded !== prevState.isExpanded) {
      // make sure to start or stop the timer when expanding / collapsing
      if (isExpanded) {
        setUserScrolled(false);
      }
      onVisibilityChange();
    }

    prevProps.current = { lines, errorCode, cluster };
    prevState.current = { isExpanded };
    // onVisibilityChange should not be a dependency, makes too many API calls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, errorCode, cluster, isExpanded]);

  const totalLines = lines ? len - 1 : 0;
  if (!userScrolled && !!totalLines && isShown()) {
    // requestAnimationFrame so this happens *after* render
    requestAnimationFrame(scrollToEnd);
  }
  let message;
  if (cluster.state === clusterStates.uninstalling) {
    message =
      errorCode === 403
        ? metricsStatusMessages.uninstalling
        : 'Cluster uninstallation has started. Uninstallation log will appear here once it becomes available.';
  } else {
    message =
      errorCode === 403
        ? metricsStatusMessages.installing
        : 'Cluster installation has started. Installation log will appear here once it becomes available.';
  }

  const view = (
    <div
      className={cx('log-window-container', !!totalLines && 'log-window-container--with-lines')}
      ref={cardRef}
    >
      {!!totalLines && screenfull.isEnabled && (
        <div className="logview-buttons">
          <Button onClick={fullScreen} variant="link" icon={<ExpandIcon />}>
            {isFullScreen ? 'Exit full screen' : 'Full screen'}
          </Button>
        </div>
      )}
      {totalLines ? (
        <div className="log-window">
          <div className="log-window__header">{totalLines} lines</div>
          <div className="log-window__body">
            <div className="log-window__scroll-pane" ref={logPaneRef} onScroll={onScroll}>
              <div className="log-window__contents">{lines || ''}</div>
            </div>
          </div>
        </div>
      ) : (
        cluster.state !== clusterStates.error && <p className="pf-v6-u-mt-sm">{message}</p>
      )}
    </div>
  );
  return isExpandable ? (
    <ExpandableSection
      id="toggle-logs"
      toggleTextCollapsed="View logs"
      toggleTextExpanded="Hide logs"
      onToggle={(_event, isExpanded) => setIsExpanded(isExpanded)}
      isExpanded={isExpanded}
    >
      {view}
    </ExpandableSection>
  ) : (
    view
  );
};

LogWindow.propTypes = {
  isExpandable: PropTypes.bool,
  clearLogs: PropTypes.func.isRequired,
  getLogs: PropTypes.func.isRequired,
  pending: PropTypes.bool,
  lines: PropTypes.string,
  len: PropTypes.number,
  logType: PropTypes.oneOf(['install', 'uninstall']),
  cluster: PropTypes.shape({
    id: PropTypes.string,
    state: PropTypes.string,
    subscription: { rh_region_id: PropTypes.string },
  }),
  errorCode: PropTypes.number,
};

export default React.memo(LogWindow, areEqual);
