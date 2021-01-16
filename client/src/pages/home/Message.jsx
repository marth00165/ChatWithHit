import React from 'react';
import { useAuthState } from '../../context/auth';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import classNames from 'classnames';

const Message = ({ message }) => {
  const { user } = useAuthState();

  const sent = message.from === user.username;
  const recieved = !sent;

  return (
    <OverlayTrigger
      placement={sent ? 'left' : 'right'}
      overlay={
        <Tooltip>
          {moment(message.createdAt).format('MMMM DD, YYYY @ h:mm a')}
        </Tooltip>
      }
      transition={false}
    >
      <div
        className={classNames('d-flex my-1', {
          'ml-auto': sent,
          'mr-auto': recieved,
        })}
      >
        <div
          className={classNames('py-2 px-3 rounded-pill', {
            'bg-primary': sent,
            'bg-secondary': recieved,
          })}
        >
          <p
            className={classNames({
              'text-white': sent,
            })}
          >
            {message.content}
          </p>
        </div>
      </div>
    </OverlayTrigger>
  );
};

export default Message;
