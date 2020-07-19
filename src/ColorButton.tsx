import React from 'react';
import classNames from 'classnames';

interface Props {
  selected: number;
  value: number;
  color: string;
  setValue: (value: number) => void;
}
interface State {}

export class ColorButton extends React.PureComponent<Props, State> {
  onClick = () => {
    let {value, setValue} = this.props;
    setValue?.(value);
  };
  render() {
    let {selected, value, color} = this.props;
    let cls = classNames('color-btn', {'color-btn-selected': selected === value});
    return (
      <div className={cls} onClick={this.onClick}>
        <div className="color-btn-color" style={{background: color}} />
      </div>
    );
  }
}
