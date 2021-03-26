import * as React from 'react';
import './input.css';

const { useState } = React;

interface inputProps {
  validator?: RegExp | null;
  validatorMessage?: string | null;
  name: string;
  placeholder: string;
  handler: CallableFunction;
  password?: boolean;
}

function Input({
  validator = null,
  validatorMessage = null,
  name,
  placeholder,
  handler,
  password = false,
}: inputProps): JSX.Element {
  const [error, setError] = useState(false);

  const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (validator && validatorMessage) {
      const isCorrect = validator.test(value);
      if (isCorrect) {
        handler(value);
      }
      setError(!isCorrect);
    } else {
      handler(value);
    }
  };

  return (
    <div className={`input-container ${error ? 'error' : ''}`}>
      <div className="input-name">{`${name}:`}</div>
      {error && validatorMessage ? (
        <div className="input-error">{`* ${validatorMessage}`}</div>
      ) : (
        ''
      )}
      <div className="input-sandwich">
        <div className="input-line-wrapper">
          <div className="input-line" />
        </div>
        <input
          className="input-item"
          type={password ? 'password' : 'text'}
          onChange={onInput}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export default Input;
