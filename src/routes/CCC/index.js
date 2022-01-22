import React from 'react';

class AAA extends React.Component {
  handleClick = () => {
    const { history } = this.props;
    history.push('./bbb');
  };

  render() {
    return <div onClick={this.handleClick}>cccccc</div>;
  }
}
export default AAA;
