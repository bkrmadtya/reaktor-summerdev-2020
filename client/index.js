function load() {
  let packageList = [];

  const packageDetail = document.getElementById('package_detail');
  const packageListTableBody = document.getElementById(
    'package_list_table_body'
  );
  const systemInfoTableBody = document.getElementById('sytem_info_table_body');

  const addSystemInfo = (os, filePath, noOfPackages) => {
    systemInfoTableBody.innerHTML += `<tr>
              <td width="20%"><strong>Operating system</strong></td>
              <td width="70%">${os}</td>
            </tr>
            <tr>
              <td width="20%"><strong>File path</strong></td>
              <td width="70%">${filePath}</td>
            </tr>
            <tr>
              <td width="20%"><strong>No of packages</strong></td>
              <td width="70%">${noOfPackages}</td>
            </tr>`;
  };

  // fetch file and system information from the server and add it to DOM
  const fetchFile = async () => {
    const os = navigator.platform;
    try {
      const response = await fetch(`/api/file/${os}`);
      const { filePath, data } = await response.json();

      // split packages on basis of double consecutive line break
      const packageArray = data.trim().split(/\n{2}/);

      addSystemInfo(os, filePath, packageArray.length);

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

  // parse each package to get relevant info (name, dependencies, description)
  const parsePackageInfo = package => {
    if (package.includes('Package')) {
      const name = package
        .match(/^Package: ([\s\S]*?)\n/i)[0]
        .replace('Package: ', '')
        .trim();

      const regexForDescription = () => {
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
            .match(regexForDescription())[0]
            .replace('Description: ', '')
            .trim()
        : 'none';

      const dependencies = package.includes('\nDepends')
        ? package
            .match(/^Depends: ([\s\S]*?)(?=\n)/im)[0] // get all the dependencies starting from "Depends: "
            .replace(/ *\([^)]*\) */g, '') // remove the brackets
            .split(',')
        : [];

      return {
        name,
        description,
        dependencies: dependencies.map(item =>
          item.replace('Depends:', '').trim()
        )
      };
    } else {
      return null;
    }
  };

  // populate each package (object) info as an element in packageList
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

  // add array of reverse dependencies for each package
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

  // display package info for a single package when its name is clicked
  // the method is called each time the a link is pressed, and it is globally available hence no identifier
  displayPackageInfo = packageName => {
    const package = packageList.find(item => item.name === packageName);
    packageDetail.innerHTML = getPackageInfo(package);
  };

  // add each page to the package list table in DOM
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

  // convert dependencies to link
  const dependenciesToLink = dependencies => {
    let result;

    if (dependencies.length === 0) {
      result = 'None';
    } else {
      result = removeOptionalDependencies(dependencies);
      result = result
        .map(item => {
          return `<a href="#" onclick="displayPackageInfo('${item}')">${item}</a>`;
        })
        .join(', ');
    }

    return result;
  };

  // remove dependencies which are optional and are seperated by pipe "|"
  // and keep one which is in the list of package
  const removeOptionalDependencies = dependencies => {
    let result = dependencies.map(item => {
      if (item.includes('|')) {
        return item.split('|').map(d => d.trim());
      }

      return item;
    });

    result = result.flat();

    // return packages that are only in the list
    return result.filter(i => packageList.some(package => package.name === i));
  };

  // convert package info for a single package when its name is clicked
  const getPackageInfo = package => {
    return `<div class="card curved">
        <div class="title">Package Info</div>
        <div class="package curved">
          <h3>Package: ${package.name}</h3>        
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
