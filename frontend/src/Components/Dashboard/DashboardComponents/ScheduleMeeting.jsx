/**
 * Dashboard Meeting component
 * @param {meets} detail of scheduled meeting
 * @returns schedule meeting list component
 */

import {
  WhatsappIcon,
  WhatsappShareButton,
  EmailShareButton,
  EmailIcon,
} from "react-share";

const ScheduledMeeting = ({ meets }) => {
  const { agenda, name, token, time } = meets.meet && meets.meet;
  const timeStr = new Date(time*1000).toLocaleString();
  
  return (
    <table className="scheduled-meet-table">
      <tr>
        <th>Meet: </th>
        <td>{name}</td>
      </tr>
      <tr>
        <th>Time: </th>
        <td>{timeStr}</td>
      </tr>
      <tr>
        <th>Team: </th>
        <td>{meets.team && meets.team}</td>
      </tr>
      <tr>
        <th>Room: </th>
        <td>{token}</td>
      </tr>
      <tr>
        <th>Agenda: </th>
        <td>{agenda}</td>
      </tr>
      <tr>
        <th>Share: </th>
        <td>
          <WhatsappShareButton
            url={token}
            title={
              "[MEETING SCHEDULED] Hello! Meeting " +
              name +
              " is scheduled on " +
              timeStr +
              " with agenda: " +
              agenda +
              ". This is the room Id"
            }
            separator={" -> "}
          >
            <WhatsappIcon size={22} />
          </WhatsappShareButton>
          <EmailShareButton
            url={token}
            subject={"MEETING SCHEDULED"}
            body={
              "Hello! Meeting " +
              name +
              " is scheduled on " +
              timeStr +
              " with agenda: " +
              agenda +
              ". This is the room Id"
            }
            separator={" -> "}
          >
            <EmailIcon size={22} />
          </EmailShareButton>
        </td>
      </tr>
    </table>
  )
};

export default ScheduledMeeting;