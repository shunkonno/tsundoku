import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export const Card = ({ children, className }) => (
  <div className={classNames('card', className)}>
    {children}
    <style jsx>{`
      background: white;
      box-sizing: border-box;
      border-radius: var(--radius-md);
      padding: var(--spacing-md);
    `}</style>
  </div>
);

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export const CardHeader = ({ children }) => (
  <header className="card-header">
    <h2 className="text-xl m-0 font-semibold text-gray-800">{children}</h2>
    <style jsx>{`
      & + :global(.card-body) {
        margin-top: var(--spacing-lg);
      }
    `}</style>
  </header>
);
CardHeader.propTypes = {
  children: PropTypes.node,
};

export const CardBody = ({ children }) => (
  <div className="card-body">
    {children}
    <style jsx>{`
      color: var(--text-mid);

      & + :global(.card-footer) {
        margin-top: var(--spacing-md);
      }
    `}</style>
  </div>
);
CardBody.propTypes = {
  children: PropTypes.node,
};

export const CardFooter = ({ children, divider = false, flex = false }) => (
  <footer className={classNames('card-footer', { divider, flex })}>
    {children}
    <style jsx>{`
      .card-footer {
        display: flex;
      }

      :global(.card-footer.flex > *) {
        flex: 1;
      }

      .card-footer.divider {
        border-top: 1px solid var(--gray-light);
        padding-top: var(--spacing-md);
      }
    `}</style>
  </footer>
);
CardFooter.propTypes = {
  children: PropTypes.node,
  divider: PropTypes.bool,
  flex: PropTypes.bool,
};

export default Card;
