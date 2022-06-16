// SPDX-FileCopyrightText: the secureCodeBox authors
//
// SPDX-License-Identifier: Apache-2.0

const HIGH_TAGS = ["HIGH"];
const LOW_TAGS = ["LOW"];

const repoUrlAnnotationKey = "metadata.scan.securecodebox.io/git-repo-url"

async function parse (fileContent, scan) {

  if (fileContent) {
    const commitUrlBase = prepareCommitUrl(scan);

    return fileContent.map(finding => {
  
      let severity = 'MEDIUM';
  
      if (containsTag(finding.Tags, HIGH_TAGS)) {
        severity = 'HIGH'
      } else if (containsTag(finding.Tags, LOW_TAGS)) {
        severity = 'LOW'
      }
  
      return {
        name: finding.RuleID,
        description: 'The name of the rule which triggered the finding: ' + finding.RuleID,
        osi_layer: 'APPLICATION',
        severity: severity,
        category: 'Potential Secret',
        attributes: {
          commit: commitUrlBase + finding.Commit,
          description: finding.Description,
          offender: finding.Secret,
          author: finding.Author,
          email: finding.Email,
          date: finding.Date,
          file: finding.File,
          line_number: finding.StartLine,
          tags: finding.Tags,
          line: finding.Match
        }
      }
    });
  }
  else
  {
    return [];
  }
}

function containsTag (tag, tags) {
  let result = tags.filter(longTag => tag.includes(longTag));
  return result.length > 0;
}

function prepareCommitUrl (scan) {
  if (!scan || !scan.metadata.annotations || !scan.metadata.annotations[repoUrlAnnotationKey]) {
    return '';
  }

  var repositoryUrl = scan.metadata.annotations[repoUrlAnnotationKey];

  return repositoryUrl.endsWith('/') ?
    repositoryUrl + 'commit/'
    : repositoryUrl + '/commit/'
}

module.exports.parse = parse;
