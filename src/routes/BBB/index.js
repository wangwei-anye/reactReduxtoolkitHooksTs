import React from 'react';

class AAA extends React.Component {
  handleClick = () => {
    const { history } = this.props;
    history.push('./');
  };

  render() {
    return <div onClick={this.handleClick}>bbbbb</div>;
  }
}
export default AAA;
