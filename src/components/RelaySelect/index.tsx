import { useRelay } from "@/contexts/RelayApi";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"

const RelaySelect = () => {
  const { relay, setRelay } = useRelay();
  const handleChange = (e: any) => {
    setRelay(e.target.value);
  };

  return (
    <FormControl sx={{ m: 2, minWidth: 200 }} fullWidth>
      <InputLabel id="demo-simple-select-label">Network</InputLabel>
      <Select
        id="network-select"
        value={relay}
        label="Relay chain"
        onChange={handleChange}
      >
        <MenuItem value="polkadot">Polkadot</MenuItem>
        <MenuItem value="kusama">Kusama</MenuItem>
      </Select>
    </FormControl>
  );
};

export default RelaySelect;
