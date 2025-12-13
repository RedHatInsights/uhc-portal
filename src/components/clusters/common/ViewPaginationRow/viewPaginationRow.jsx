import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Pagination } from '@patternfly/react-core';

import * as actions from '../../../../redux/actions/viewOptionsActions';

const ViewPaginationRow = ({
  currentPage,
  pageSize,
  totalCount,
  onFirstPage,
  onLastPage,
  onPreviousPage,
  onNextPage,
  onPageInput,
  onPerPageSelect,
  variant,
  isDisabled,
  perPageOptions,
}) => (
  <Pagination
    page={currentPage}
    perPage={pageSize}
    itemCount={totalCount}
    itemsStart={totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}
    itemsEnd={Math.min(currentPage * pageSize, totalCount)}
    onFirstClick={onFirstPage}
    onLastClick={onLastPage}
    onPreviousClick={onPreviousPage}
    onNextClick={onNextPage}
    onSetPage={onPageInput}
    onPerPageSelect={onPerPageSelect}
    variant={variant}
    dropDirection={variant === 'bottom' ? 'up' : 'down'}
    isCompact={variant !== 'bottom'}
    isDisabled={isDisabled}
    perPageOptions={perPageOptions}
  />
);

ViewPaginationRow.propTypes = {
  // viewType *is* used, in mapDispatchToProps.
  // The linter is not smart enough to figure it out, therefor:
  // eslint-disable-next-line react/no-unused-prop-types
  viewType: PropTypes.string, // Check viewOptionsReducer to see how this works.
  currentPage: PropTypes.number,
  pageSize: PropTypes.number,
  totalCount: PropTypes.number,
  onFirstPage: PropTypes.func,
  onLastPage: PropTypes.func,
  onNextPage: PropTypes.func,
  onPreviousPage: PropTypes.func,
  onPageInput: PropTypes.func,
  onPerPageSelect: PropTypes.func,
  variant: PropTypes.oneOf(['top', 'bottom']).isRequired,
  isDisabled: PropTypes.bool,
  perPageOptions: PropTypes.arrayOf(
    PropTypes.shape({ title: PropTypes.string, value: PropTypes.number }),
  ),
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onFirstPage: () => dispatch(actions.onFirstPage(ownProps.viewType)),
  onLastPage: () => dispatch(actions.onLastPage(ownProps.viewType)),
  onNextPage: () => dispatch(actions.onNextPage(ownProps.viewType)),
  onPreviousPage: () => dispatch(actions.onPreviousPage(ownProps.viewType)),
  onPageInput: (_event, pageIndex) => dispatch(actions.onPageInput(pageIndex, ownProps.viewType)),
  onPerPageSelect: (_event, perPage) => {
    dispatch(actions.onPerPageSelect(perPage, ownProps.viewType));
  },
});

export default connect(null, mapDispatchToProps)(ViewPaginationRow);
