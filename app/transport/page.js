import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return <CrudPage title="Transport" api="/api/transport" canWrite={canWrite} fields={[{key:"routeName",label:"Route"},{key:"vehicleNo",label:"Vehicle No"},{key:"driverName",label:"Driver Name"},{key:"driverPhone",label:"Driver Phone",required:false},{key:"pickupPoint",label:"Pickup Point",required:false},{key:"monthlyFee",label:"Monthly Fee",type:"number"}]} columns={[{key:"routeName",label:"Route"},{key:"vehicleNo",label:"Vehicle No"},{key:"driverName",label:"Driver Name"},{key:"driverPhone",label:"Driver Phone"},{key:"pickupPoint",label:"Pickup Point"},{key:"monthlyFee",label:"Monthly Fee"}]}/>;
}
