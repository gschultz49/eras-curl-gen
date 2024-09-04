import React, { useState, useEffect } from 'react';

const ErasCurliGenerator: React.FC = () => {
  const [promptUrl, setPromptUrl] = useState(
    'https://www.linkedin.com/bowtie/prompts/630de035-9dca-467b-890b-110220269fe2'
  );
  const [campaignId, setCampaignId] = useState(
    '5f4d8b3b-7b0f-4f9b-8e2e-3e1f2e5f4e4e'
  );
  const [ncrmList, setNcrmList] = useState('ncrm_list');
  const [lixExists, setLixExists] = useState(true);
  const [lixKeyName, setLixKeyName] = useState('my.lix.key');
  const [subType, setSubType] = useState('enabled-test-population');
  const [emailType, setEmailType] = useState<'EDITORIAL' | 'CREATOR_TIPS'>(
    'EDITORIAL'
  );
  const [submitted, setSubmitted] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const queryParams = new URLSearchParams(window.location.search);

      const promptUrlFromQuery = queryParams.get('promptUrl') || '';
      const campaignIdFromQuery = queryParams.get('campaignId') || '';
      const ncrmListFromQuery = queryParams.get('ncrmList') || '';
      const emailTypeFromQuery = queryParams.get('emailType') || 'EDITORIAL';
      const lixExistsFromQuery = queryParams.get('lixExists') === 'true';
      const lixKeyNameFromQuery = queryParams.get('lixKeyName') || '';
      const subTypeFromQuery = queryParams.get('subType') || '';

      setPromptUrl(promptUrlFromQuery);
      setCampaignId(campaignIdFromQuery);
      setNcrmList(ncrmListFromQuery);
      setEmailType(emailTypeFromQuery as 'EDITORIAL' | 'CREATOR_TIPS');
      setLixExists(lixExistsFromQuery);
      setLixKeyName(lixKeyNameFromQuery);
      setSubType(subTypeFromQuery);

      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized) {
      const queryParams = new URLSearchParams({
        promptUrl,
        campaignId,
        ncrmList,
        emailType,
        lixExists: lixExists.toString(),
        lixKeyName,
        subType,
      }).toString();

      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}?${queryParams}`
      );
    }
  }, [
    promptUrl,
    campaignId,
    ncrmList,
    emailType,
    lixExists,
    lixKeyName,
    subType,
    initialized,
  ]);

  const promptId = promptUrl.split('/').pop() || '';

  const isSubmitDisabled =
    !promptUrl ||
    !campaignId ||
    !ncrmList ||
    !emailType ||
    (lixExists && (!lixKeyName || !subType));
  const isCopyDisabled = isSubmitDisabled;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const curlCommand = `--data-raw '{"entityUrn":"urn:li:activity:${campaignId}","promoter":"urn:li:member:469099147","headline":"${emailType}|${promptId}|PremiumSend","contentCategory":"TEST_INAPP","targetCountries":["urn:li:country:us"],"ncrmTableName":"${ncrmList}","sentImmediately":true,"targetedCountries":[],"targetLocale":{"language":"en","country":"US"}${
    lixExists ? `,"subType":"${subType}"` : ''
  },"localDeliveryTime":{"timeOfDay":{"hour":10,"minute":10,"second":0},"date":{"month":8,"day":29,"year":2024}}}'`;

  const notificationConfigCommand = `
curli --dv-auth SELF -X GET -H 'Accept:application/json' -H 'X-RestLi-Protocol-Version:2.0.0' -f prod-ltx1 --pretty-print "d2://editorialNotificationConfig?notificationType=EDITORIAL_TEST_CAMPAIGN_INAPP&q=notificationType"
`;

  const deleteVariantCommand = `
curli --dv-auth SELF --pretty-print "d2://editorialNotificationConfig/($params:(),notificationType:EDITORIAL_TEST_CAMPAIGN_INAPP,subType:${subType})" \\
-X DELETE \\
-H 'Accept:application/json' \\
-H 'X-RestLi-Protocol-Version:2.0.0' -f prod-ltx1 -vik
`;

  const addNotificationConfigCommand = `
curli --dv-auth SELF --pretty-print -f prod-ltx1 "d2://editorialNotificationConfig" \\
-X POST \\
-H 'X-RestLi-Method:create' \\
-H 'Accept:application/json' \\
-H 'Content-Type:application/json' \\
-H 'X-RestLi-Protocol-Version:2.0.0' \\
--data '{
    "notificationConfigKey": {
        "subType": "${subType}",
        "notificationType": "EDITORIAL_TEST_CAMPAIGN_INAPP"
    },
    "lixKey": "${lixKeyName}"
}'
`;

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gray-100 p-12">
      <div className="w-full bg-white p-6 rounded shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Eras Curli Generator
        </h1>

        <div className="mb-4 w-full">
          <label className="block text-sm font-medium">Prompt URL</label>
          <input
            type="text"
            value={promptUrl}
            onChange={(e) => setPromptUrl(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            placeholder="https://www.linkedin.com/bowtie/prompts/630de035-9dca-467b-890b-110220269fe2"
          />
        </div>

        <div className="mb-4 w-full">
          <label className="block text-sm font-medium">Campaign ID</label>
          <input
            type="text"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            placeholder="5f4d8b3b-7b0f-4f9b-8e2e-3e1f2e5f4e4e"
          />
          <p className="text-xs text-gray-500">
            Check the `/bowtie/api/prompts/urn:li:contentCreationPrompt` request
            in your network tab for this information
          </p>
        </div>

        <div className="mb-4 w-full">
          <label className="block text-sm font-medium">NCRM List</label>
          <input
            type="text"
            value={ncrmList}
            onChange={(e) => setNcrmList(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            placeholder="ncrm_list"
          />
          <p className="text-xs text-gray-500">
            Make sure the list is exported to WAR!
          </p>
        </div>

        <div className="mb-4 w-full">
          <label className="block text-sm font-medium">Email Type</label>
          <select
            value={emailType}
            onChange={(e) =>
              setEmailType(e.target.value as 'EDITORIAL' | 'CREATOR_TIPS')
            }
            className="w-full mt-1 p-2 border border-gray-300 rounded"
          >
            <option value="EDITORIAL">Editorial Outreach</option>
            <option value="CREATOR_TIPS">Creator Tips</option>
          </select>
          <p className="text-xs text-gray-500">
            Are you sending an 'Editorial Outreach' or 'Creator Tips' email?
          </p>
        </div>

        <div className="mb-4 w-full">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={lixExists}
              onChange={() => setLixExists(!lixExists)}
              className="mr-2"
            />
            Do you need a lix?
          </label>
        </div>

        {lixExists && (
          <>
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium">Lix key name</label>
              <input
                type="text"
                value={lixKeyName}
                onChange={(e) => setLixKeyName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
                placeholder="my.lix.key"
              />
              <p className="text-xs text-gray-500">
                This is the name of the lix key
              </p>
            </div>

            <div className="mb-4 w-full">
              <label className="block text-sm font-medium">
                Lix variant name (subtype)
              </label>
              <input
                type="text"
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded"
                placeholder="enabled-test-population"
              />
              <p className="text-xs text-gray-500">
                This is the name of the enabled population on the lix
              </p>
            </div>
          </>
        )}

        <div className="relative mb-4 w-full">
          <button
            onClick={handleSubmit}
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
              isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitDisabled}
          >
            Submit
          </button>
          {isSubmitDisabled && (
            <div className="absolute top-full left-0 mt-1 bg-gray-700 text-white text-sm px-2 py-1 rounded">
              Please fill out all required fields
            </div>
          )}
        </div>

        {submitted && (
          <div
            className={`mt-6 p-4 w-full ${
              isSubmitDisabled ? 'border border-red-500' : ''
            }`}
          >
            {lixExists && (
              <>
                <h2 className="text-lg font-semibold">
                  Because you need a lix, you'll need to first add the lix and
                  its variant as a subtype:
                </h2>

                <div className="mt-4 p-4 bg-gray-100 border rounded">
                  <p className="font-medium">
                    To see all the notificationConfigs current values:
                  </p>

                  <pre className="whitespace-pre-wrap break-all mt-2">
                    {notificationConfigCommand}
                  </pre>
                  <button
                    onClick={() => handleCopy(notificationConfigCommand)}
                    className={`mt-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 ${
                      isCopyDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isCopyDisabled}
                  >
                    Copy to clipboard
                  </button>
                </div>

                <div className="mt-4 p-4 bg-gray-100 border rounded">
                  <p className="font-medium">
                    If your new variant name is not unique, you need to delete
                    the existing one. Ensure that no other in-progress fannouts
                    are currently using this variant, then run this command to
                    delete the existing variant:
                  </p>

                  <pre className="whitespace-pre-wrap break-all mt-2">
                    {deleteVariantCommand}
                  </pre>
                  <button
                    onClick={() => handleCopy(deleteVariantCommand)}
                    className={`mt-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 ${
                      isCopyDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isCopyDisabled}
                  >
                    Copy to clipboard
                  </button>
                </div>

                <div className="mt-4 p-4 bg-gray-100 border rounded">
                  <p className="font-medium">
                    To add a new notificationConfig, run this command:
                  </p>
                  <pre className="whitespace-pre-wrap break-all mt-2">
                    {addNotificationConfigCommand}
                  </pre>
                  <button
                    onClick={() => handleCopy(addNotificationConfigCommand)}
                    className={`mt-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 ${
                      isCopyDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isCopyDisabled}
                  >
                    Copy to clipboard
                  </button>
                </div>

                <h2 className="text-lg font-semibold mt-8">
                  Then, use this data to execute the send:
                </h2>
              </>
            )}
            <p className="text-xs text-gray-500">
              You need a valid Bowtie cookie to execute this command, use the
              `Copy as curl` button for any GET request in Bowtie in the network
              tab, and change the URL to
              `https://www.linkedin.com/bowtie/api/normScheduledCommunication`.
              See this{' '}
              <a
                href="https://linkedin-randd.slack.com/archives/C04V6EVLX1Q/p1723578877544639?thread_ts=1723566239.417899&cid=C04V6EVLX1Q"
                target="_blank"
              >
                thread
              </a>{' '}
              for an example
            </p>
            <div className="mt-4 p-4 bg-gray-100 border rounded">
              <pre className="whitespace-pre-wrap break-all">{curlCommand}</pre>
              <button
                onClick={() => handleCopy(curlCommand)}
                className={`mt-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 ${
                  isCopyDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isCopyDisabled}
              >
                Copy to clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErasCurliGenerator;
