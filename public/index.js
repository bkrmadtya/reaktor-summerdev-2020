function load() {
  let packageList = [];
  const packageDetail = document.getElementById('package_detail');
  const packageListTableBody = document.getElementById(
    'package_list_table_body'
  );
  const systemInfoTableBody = document.getElementById('sytem_info_table_body');

  const displaySystemInfo = (platform, filePath, noOfPackages) => {
    systemInfoTableBody.innerHTML += `<tr>
              <td><strong>Operating system</strong></td>
              <td>${platform}</td>
            </tr>
            <tr>
              <td><strong>File path</strong></td>
              <td>${filePath}</td>
            </tr>
            <tr>
              <td><strong>No of packages</strong></td>
              <td>${noOfPackages}</td>
            </tr>`;
  };

  const fetchFile = async () => {
    try {
      const response = await fetch('/api/file');
      const { platform, filePath, data } = await response.json();

      // split packages on basis of double consecutive line break
      const packageArray = data.trim().split(/\n{2}/);

      displaySystemInfo(platform, filePath, packageArray.length);

      fillPackageList(packageArray);
    } catch (e) {
      console.log(e);
    }
  };

  const sortByName = arr => {
    return arr.sort((item1, item2) => {
      // 0 i.e. if the name is same then the items are not sorted and kept in original place
      let result = 0;
      result = item1.name < item2.name ? -1 : 1;

      return result;
    });
  };

  const parsePackageInfo = package => {
    if (package.includes('Package')) {
      const name = package
        .match(/^Package: ([\s\S]*?)\n/i)[0]
        .replace('Package: ', '')
        .trim();

      const regexOfDescription = () => {
        let lookBehind = '.$';
        const indexOfOriginal = package.indexOf('Original');
        const indexOfHomepage = package.indexOf('Homepage');

        if (indexOfOriginal > 0 || indexOfHomepage > 0) {
          lookBehind =
            indexOfOriginal < indexOfHomepage
              ? indexOfOriginal > 0
                ? 'Original'
                : 'Homepage'
              : indexOfHomepage > 0
              ? 'Homepage'
              : 'Original';
        }

        let regex = new RegExp(
          '^Description: ([\\s\\S]*?)(.*)(?=' + lookBehind + ')',
          'im'
        );

        return regex;
      };

      const description = package.includes('Description')
        ? package
            .match(regexOfDescription())[0]
            .replace('Description: ', '')
            .trim()
        : 'none';

      const dependencies = package.includes('\nDepends')
        ? package
            .match(/^Depends: ([\s\S]*?)(?=\n)/im)[0]
            .replace(/ *\([^)]*\) */g, '')
            .split(',')
        : [];

      return {
        name,
        description,
        dependencies: dependencies.map(item =>
          item.replace('Depends: ', '').trim()
        )
      };
    } else {
      return null;
    }
  };

  const fillPackageList = packageArr => {
    packageArr.forEach(package => {
      const parsedPackage = parsePackageInfo(package);
      if (parsedPackage) {
        packageList.push(parsedPackage);
      }
    });
    packageList = sortByName(packageList);
    addPackageToTable();
    addReverseDependencies();
  };

  const addReverseDependencies = () => {
    packageList = packageList.map(package => {
      const reverseDependencies = packageList
        .map(item => {
          if (item.dependencies.indexOf(package.name) != -1) {
            return item.name;
          }
        })
        .filter(item => item);

      return { ...package, reverseDependencies: [...reverseDependencies] };
    });
  };

  displayPackageInfo = packageName => {
    const package = packageList.find(item => item.name === packageName);
    packageDetail.innerHTML = getPackageInfo(package);
  };

  const addPackageToTable = () => {
    packageListTableBody.innerHTML += packageList
      .map(
        (item, index) =>
          `<tr>
            <td>
              ${index + 1}
            </td>
            <td>
              <a href="#" onclick="displayPackageInfo('${item.name}')">
              ${item.name}
              </a>
            </td>
          </tr>`
      )
      .join('');
  };

  const dependenciesToLink = list => {
    let result;

    if (list.length === 0) {
      result = 'None';
    } else {
      result = list
        .map(
          item =>
            `<a href="#" onclick="displayPackageInfo('${item}')">${item}</a>`
        )
        .join(', ');
    }

    return result;
  };

  const getPackageInfo = package => {
    return `<div class="card curved">
        <div class="title ">Package Info</div>
        <div class="package curved">
      <h2>Package: ${package.name}</h2>
      <p><strong>Dependencies:</strong> ${dependenciesToLink(
        package.dependencies
      )}
      </p>
      <p><strong>Reverse Dependencies:</strong> ${dependenciesToLink(
        package.reverseDependencies
      )}
      </p>
      <div><strong>Description: </strong><pre>${package.description}</pre>
      </div>
      </div>
    </div>`;
  };

  fetchFile();
}
