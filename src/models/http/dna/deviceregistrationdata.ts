export interface DeviceRegistrationData {
  deviceId: string;
  name: string;

  /// <summary>
  /// a value of '0' by default? (GUESSING!)
  /// a value of '1' should be used if the response from GET /grantedlicenses/me was: 404 / DeviceNotRegisteredForPrivilegedLicense(40406008)
  /// a value of '2' should be used if the response from GET /grantedlicenses/me was: 404 / DeviceNotRegisteredForNonPrivilegedLicense(40406009)
  /// </summary>
  resourceType: 0 | 1 | 2;
}
