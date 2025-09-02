import { useEditSubscription } from '../common/useEditSubscription';

export const useEditClusterName = () => {
  const { isSuccess, error, isError, isPending, mutate, reset } = useEditSubscription();

  /* ************************************************
   * Set cluster name
   * @param subscriptionID
   * @param displayName
   *
   * This sets the display_name of the subscription object, which is what the UI uses to display the cluster name
   * There is a display_name on the cluster object, but it is not used and was removed from the API in SDA-5813
   * The cluster name property cannot be changed after cluster creation so we can only set the subscription.display_name
   * ************************************************ */
  const setClusterName = ({
    subscriptionID,
    displayName,
  }: {
    subscriptionID: string;
    displayName: string;
  }) =>
    mutate({
      subscriptionID,
      data: { display_name: displayName },
    });
  return {
    isSuccess,
    error,
    isError,
    isPending,
    mutate: setClusterName,
    reset,
  };
};
