# Upgrading

## From 2.X to 3.X

### Upgraded Kubebuilder Version to v3
The CRD's are now using `apiextensions.k8s.io/v1` instead of `apiextensions.k8s.io/v1beta1` which requries at least Kubernetes Version 1.16 or higher.
The Operator now uses the new kubebuilder v3 command line flag for enabling leader election and setting the metrics port. If you are using the official secureCodeBox Helm Charts for your deployment this has been updated automatically. 

If you are using a custom deployment you have to change the `--enable-leader-election` flag to `--leader-elect` and `--metrics-addr` to `--metrics-bind-address`. For more context see: https://book.kubebuilder.io/migration/v2vsv3.html#tldr-of-the-new-gov3-plugin

➡️  [Reference: #512](https://github.com/secureCodeBox/secureCodeBox/pull/512)

### Restructured the secureCodeBox HelmCharts to introduce more consistency in HelmChart Values
The secureCodeBox HelmCharts for hooks and scanners are following a new structure for all HelmChart Values:

Instead of secureCodebox Version 2 example:

```yaml
image:
  # image.repository -- Container Image to run the scan
  repository: owasp/zap2docker-stable
  # image.tag -- defaults to the charts appVersion
  tag: null

parserImage:
  # parserImage.repository -- Parser image repository
  repository: docker.io/securecodebox/parser-zap
  # parserImage.tag -- Parser image tag
  # @default -- defaults to the charts version
  tag: null

parseJob:
  # parseJob.ttlSecondsAfterFinished -- seconds after which the kubernetes job for the parser will be deleted. Requires the Kubernetes TTLAfterFinished controller: https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/
  ttlSecondsAfterFinished: null

scannerJob:
  # scannerJob.ttlSecondsAfterFinished -- seconds after which the kubernetes job for the scanner will be deleted. Requires the Kubernetes TTLAfterFinished controller: https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/
  ttlSecondsAfterFinished: null
  # scannerJob.backoffLimit -- There are situations where you want to fail a scan Job after some amount of retries due to a logical error in configuration etc. To do so, set backoffLimit to specify the number of retries before considering a scan Job as failed. (see: https://kubernetes.io/docs/concepts/workloads/controllers/job/#pod-backoff-failure-policy)
  # @default -- 3
  backoffLimit: 3
```

The new HelmChart Values structure in secureCodebox Version 3 looks like:

```yaml
parser:
  image:
    # parser.image.repository -- Parser image repository
    repository: docker.io/securecodebox/parser-zap
    # parser.image.tag -- Parser image tag
    # @default -- defaults to the charts version
    tag: null

  # parser.ttlSecondsAfterFinished -- seconds after which the kubernetes job for the parser will be deleted. Requires the Kubernetes TTLAfterFinished controller: https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/
  ttlSecondsAfterFinished: null
  # @default -- 3
  backoffLimit: 3

scanner:
  image:
    # scanner.image.repository -- Container Image to run the scan
    repository: owasp/zap2docker-stable
    # scanner.image.tag -- defaults to the charts appVersion
    tag: null

  # scanner.ttlSecondsAfterFinished -- seconds after which the kubernetes job for the scanner will be deleted. Requires the Kubernetes TTLAfterFinished controller: https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/
  ttlSecondsAfterFinished: null
  # scanner.backoffLimit -- There are situations where you want to fail a scan Job after some amount of retries due to a logical error in configuration etc. To do so, set backoffLimit to specify the number of retries before considering a scan Job as failed. (see: https://kubernetes.io/docs/concepts/workloads/controllers/job/#pod-backoff-failure-policy)
  # @default -- 3
  backoffLimit: 3
```
➡️  [Reference: #472](https://github.com/secureCodeBox/secureCodeBox/issues/472)
➡️  [Reference: #483](https://github.com/secureCodeBox/secureCodeBox/pull/483)
➡️  [Reference: #484](https://github.com/secureCodeBox/secureCodeBox/pull/484)

### Added scanner.appendName to chart values
Using {{ .Release.name }} in the `nmap` HelmChart Name for `scanTypes` causes issues when using this chart as a dependency of another chart. All scanners HelmCharts already used a fixed name for the `scanType` they introduce, with one exception: the `nmap` scanner HelmChart. 

The nmap exception was originally introduced to make it possible configure yourself an `nmap-privilidged` scanType, which is capable of running operating system scans which requires some higher privileges: https://docs.securecodebox.io/docs/scanners/nmap#operating-system-scans

This idea for extending the name of a scanType is now in Version 3 general available for all HelmCharts.

The solution was to add a new HelmChart Value `scanner.appendName` for appending a suffix to the already defined scanType name. 
Example: the `scanner.nameAppend: -privileged` for the ZAP scanner will create `zap-baseline-scan-privileged`, `zap-api-scan-privileged`, `zap-full-scan-privileged` as new scanTypes instead of `zap-baseline-scan`, `zap-api-scan`, `zap-full-scan`.

➡️  [Reference: #469](https://github.com/secureCodeBox/secureCodeBox/pull/469)

### Renamed demo-apps to demo-targets
The provided vulnerable demos are renamed from `demo-apps` to `demo-targets`, this includes the namespace and the folder of the [helmcharts](https://github.com/secureCodeBox/secureCodeBox/tree/main/demo-targets).

### Renamed the hook declarative-subsequent-scans to cascading-scans
The hook responsible for cascading scans is renamed from `declarative-subsequent-scans` to `cascading-scans`.

➡️  [Reference: #481](https://github.com/secureCodeBox/secureCodeBox/pull/481)

### Fixed Name Consistency In Docker Images / Repositories
For the docker images for scanners and parsers we already had the naming convention of prefixing these images with `scanner-` or `parser-`.

Hook images however were named inconsistently (some prefixed with `hook-` some unprefixed).
To introduce more consistency we renamed all hook images and prefix them with `hook-` like we did with parser and scanner images.

Please beware of this if you are referencing some of our hook images in your own HelmCharts or custom implementations.

➡️  [Reference: #500](https://github.com/secureCodeBox/secureCodeBox/pull/500)

### Renamed `lurcher` to `lurker`

In the 3.0 release, we corrected the misspelling in `lurcher`. To remove the remains after upgrade, delete the old service accounts and roles from the namespaces where you have executed scans in the past:

```bash
# Find relevant namespaces
kubectl get serviceaccounts --all-namespaces | grep lurcher

# Delete role, role binding and service account for the specific namespace 
kubectl --namespace <NAMESPACE> delete serviceaccount lurcher
kubectl --namespace <NAMESPACE> delete rolebindings lurcher
kubectl --namespace <NAMESPACE> delete role lurcher
```

➡️  [Reference: #537](https://github.com/secureCodeBox/secureCodeBox/pull/537)

### Removed Hook Teams Webhook
We implemented a more general *[notification hook](https://docs.securecodebox.io/docs/hooks/notification-hook)* which can be used to notify different systems like *[MS Teams](https://docs.securecodebox.io/docs/hooks/notification-hook#configuration-of-a-ms-teams-notification)* and *[Slack](https://docs.securecodebox.io/docs/hooks/notification-hook#configuration-of-a-slack-notification)* and also [Email](https://docs.securecodebox.io/docs/hooks/notification-hook#configuration-of-an-email-notification) based in a more flexible way with [custom message templates](https://docs.securecodebox.io/docs/hooks/notification-hook#custom-message-templates). With this new hook in place it is not nessesary to maintain the preexisting MS Teams Hook any longer and therefore we removed it.

➡️  [Reference: #570](https://github.com/secureCodeBox/secureCodeBox/pull/570)