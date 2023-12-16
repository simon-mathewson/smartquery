import {
  CheckCircleOutline,
  SettingsEthernet,
  WarningAmber,
} from "@mui/icons-material";
import { Button } from "~/components/shared/Button/Button";
import React, { useEffect, useState } from "react";
import { ConnectionSchema, FormSchema, isFormValid } from "../utils";
import { trpc } from "~/main";

export type TestConnectionProps = {
  form: FormSchema;
};

export const TestConnection: React.FC<TestConnectionProps> = (props) => {
  const { form } = props;

  const [isTesting, setIsTesting] = useState(false);
  const [hasSucceeded, setHasSucceeded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setHasFailed(false);
    setHasSucceeded(false);
  }, [form]);

  const test = async () => {
    setIsTesting(true);
    setHasFailed(false);
    setHasSucceeded(false);

    try {
      await trpc.connectDb.mutate(form as ConnectionSchema);
      setHasSucceeded(true);
    } catch (error) {
      setHasFailed(true);
    }

    setIsTesting(false);
  };

  return (
    <Button
      disabled={isTesting || !isFormValid(form)}
      icon={<SettingsEthernet />}
      label="Test connection"
      onClick={test}
      {...(isTesting && {
        label: "Testing connection...",
      })}
      {...(hasSucceeded && {
        icon: <CheckCircleOutline />,
        label: "Connection succeeded",
        variant: "success",
      })}
      {...(hasFailed && {
        icon: <WarningAmber />,
        label: "Connection failed",
        variant: "danger",
      })}
    />
  );
};
