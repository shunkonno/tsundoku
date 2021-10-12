import React from 'react'
import PropTypes from 'prop-types'

export const Field = ({ label, children }) => (
  <div className="mb-6">
    {label && <div className="text-gray-800 mb-2">{label}</div>}
    <div>{children}</div>
  </div>
)

Field.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node
}

export default Field
