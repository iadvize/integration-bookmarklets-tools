(function CMPHelper() {

	let DEFAULT_VENDOR_ID_SUBSTRING = "dvize";

	function getVendorIDSubstring() {
		if (slug = prompt(`⚙️ By default, this script will try to detect iAdvize vendor ID by looking for the string ${DEFAULT_VENDOR_ID_SUBSTRING}.\n\nYou can override the value if you want:`, DEFAULT_VENDOR_ID_SUBSTRING)) {
			DEFAULT_VENDOR_ID_SUBSTRING = slug;
		}
		return DEFAULT_VENDOR_ID_SUBSTRING;
	}

	const CMPS = [
		{
			name: "Didomi",
			test: () => !!window.Didomi,
			openWidget: () => Didomi.preferences.show(),
			detectVendorID(callback) {
				const VENDOR_ID_SUBSTRING = getVendorIDSubstring();
				const candidates = Didomi.getVendors()
				    .filter(vendor => (vendor.didomiId).toLowerCase().includes(VENDOR_ID_SUBSTRING))
				    .map(vendor => vendor.didomiId);
				callback(candidates);
			}
		},
		{
			name: "Axeptio",
			test: () => !!window.axeptioSDK,
			openWidget: () => axeptioSDK.openCookies(),
			detectVendorID(callback) {
				const VENDOR_ID_SUBSTRING = getVendorIDSubstring();
				function displayResult(choices) {
					const vendorIDS = Object.keys(choices).filter(vendorID => !vendorID.includes('$'));
					const potentialIDZVendorId = vendorIDS.filter(vendorID => vendorID.toLowerCase().includes(VENDOR_ID_SUBSTRING));
					callback(potentialIDZVendorId);
				}
				axeptioSDK.on("cookies:complete", displayResult, {replay: false, once: true});
				alert('☝️ I will open the CMP Widget automatically for you.\nIn order to enable the iAdvize vendorID detection, please:\n\n - click on **Accept all button** to enable the vendorID detection.');
				axeptioSDK.openCookies();
			}
		},
		{
			name: "Trust Commanders",
			test: () => !!window.cact,
			openWidget: () => cact('consentCenter.show'),
			detectVendorID(callback) {
				alert('☝️ I will open the CMP Widget for you.\nIn order to enable the iAdvize vendorID detection, please:\n\n  1. Go on the partners/vendors section in the Widget\n  2. Refuse/disable all vendors\n  3. ACCEPT ONLY the iAdvize vendor\n  4. Save / validate your consent');
				cact('once', 'consent-updated', (event) => {
					cact('consent.get', function(result) {
						const vendorIDS = Object.keys(result.consent.vendors);
						const vendorStates = Object.values(result.consent.vendors);
						const candidates = vendorStates
							.map((state, i) => ({status: state.status, id: vendorIDS[i]}))
							.filter(vendor => vendor.status === 'on')
							.map(vendor => vendor.id);
						callback(candidates);
					});
				});
				cact('consentCenter.show');
			}
		},
		{
			name: "One Trust",
			test: () => !!window.OneTrust,
			openWidget: () => OneTrust.ToggleInfoDisplay(),
			detectVendorID(callback) {
				const VENDOR_ID_SUBSTRING = getVendorIDSubstring();
				const groups = OneTrust.GetDomainData().Groups
					.map(g => ({id: g.CustomGroupId, name: g.GroupName, description: g.GroupDescription}))
					.filter(g => (g.name).toLowerCase().includes(VENDOR_ID_SUBSTRING) || (g.description).toLowerCase().includes(VENDOR_ID_SUBSTRING))
					.map(g => `[${g.id}] ${g.name} (${g.description.substring(0, 25)})`);
				callback(groups);
			}
		}
	];
	
	const CMP = CMPS.reduce((result, CMP) => CMP.test() ? CMP : result, null);

	if (CMP) {
		alert(`✅ I found the following CMP on the website:\n\n${CMP.name}`);
	} else {
		alert(`❌ I haven't found any of the ${Object.keys(CMPS).length} CMPs with which iAdvize is integrated.`);
		return;
	}

	if (confirm("📜 Would you like to open the CMP Widget?")) {
		
		CMP.openWidget();
		return;
		
	}

	if (confirm("🔍 Would you like me to try and find the iAdvize vendor ID in the CMP?")) {

		const candidates = CMP.detectVendorID((candidates) => {
			if (candidates.length === 0) { // NONE
				alert("❌ OOPS, I couldn't find anything");
			} else if (candidates.length === 1) { // ONE
				prompt("✅ This should be the iAdvize vendor ID you're looking for:", candidates[0]);
			} else { // MULTIPLE
				alert(`⚠️ I've found several candidates who seem to match:\n\n${candidates.join('\n')}`);
			}
		});
		
	}
	
})();

// TRUST_COMMANDER => Maty
// DIDOMI => Rouge Gorge
// AXEPTIO => Bobochic
// ONE_TRUST => TheKooples
