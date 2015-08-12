function RegExConstant() {
  return {
    email:      /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])+$/i,
    latLong:    /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
    zip:        /^\d{5}(?:[-\s]\d{4})?$/,
    timeZone:   /^GMT\s[+-]\d{2}:\d{2}$/,
    timeStr:    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  };
}

angular.module( 'angular-m' )
  .constant( 'REGEX', RegExConstant );
